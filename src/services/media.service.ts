import { PrismaClient, Media } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import sharp from "sharp";
import type { Storage } from "@/adapters/storage/Storage";
import type {
  MediaCollectionOptions,
  MediaConversion,
} from "@/config/media-collections";
import { createStorage } from "@/config/storage.config";
import { mediaCollections } from "@/config/media-collections";
const config = require("../../config");

export interface UploadedFile {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
}

export interface AttachFileOptions {
  file: UploadedFile;
  modelType: string;
  modelId: number;
  collection: string;
  name?: string;
  customProperties?: Record<string, unknown>;
}

export class MediaService {
  constructor(
    private prisma: PrismaClient,
    private storage: Storage,
    private collections: Record<string, MediaCollectionOptions> = {}
  ) {}

  async attachFile(opts: AttachFileOptions): Promise<Media> {
    const collectionCfg = this.collections[opts.collection];

    if (
      collectionCfg?.acceptsMimeTypes &&
      !collectionCfg.acceptsMimeTypes.includes(opts.file.mimetype)
    ) {
      throw new Error("Invalid mime type");
    }

    if (collectionCfg?.acceptsExtensions) {
      const extCheck = path
        .extname(opts.file.originalname)
        .replace(".", "")
        .toLowerCase();
      if (!collectionCfg.acceptsExtensions.includes(extCheck)) {
        throw new Error("Invalid file extension");
      }
    }

    if (collectionCfg?.singleFile) {
      const existing = await this.prisma.media.findFirst({
        where: {
          model_type: opts.modelType,
          model_id: Number(opts.modelId),
          collection_name: opts.collection,
        },
      });
      if (existing) {
        await this.delete(existing.id);
      }
    }

    if (collectionCfg?.maxFiles) {
      const count = await this.prisma.media.count({
        where: {
          model_type: opts.modelType,
          model_id: Number(opts.modelId),
          collection_name: opts.collection,
        },
      });
      if (count >= collectionCfg.maxFiles) {
        throw new Error("Collection maxFiles reached");
      }
    }

    const uuid = uuidv4();
    const ext = path.extname(opts.file.originalname);
    const fileName = `${uuid}${ext}`;
    const key = `${opts.modelType}/${opts.modelId}/${opts.collection}/${fileName}`;

    await this.storage.put(key, opts.file.buffer, opts.file.mimetype);

    const conversions: Record<string, string> = {};
    if (collectionCfg?.conversions) {
      for (const conv of collectionCfg.conversions) {
        const convName = conv.name;
        const convKey = this.conversionPath(opts, uuid, conv, ext);
        const buf = await this.generateConversion(opts.file.buffer, conv);
        await this.storage.put(convKey, buf, opts.file.mimetype);
        conversions[convName] = convKey;
      }
    }

    const media = await this.prisma.media.create({
      data: {
        model_type: opts.modelType,
        model_id: Number(opts.modelId),
        uuid,
        collection_name: opts.collection,
        name: opts.name ?? opts.file.originalname,
        file_name: fileName,
        mime_type: opts.file.mimetype,
        disk: config.storage.driver,
        size: BigInt(opts.file.size),
        manipulations: "{}",
        custom_properties: JSON.stringify(opts.customProperties ?? {}),
        generated_conversions: JSON.stringify(conversions),
        responsive_images: "{}",
      },
    });

    return media;
  }

  async insertRecord(opts: {
    modelType: string;
    modelId: number;
    collection: string;
    fileName: string;
    mimeType?: string;
    size: number;
    name?: string;
    disk?: string;
    customProperties?: Record<string, unknown>;
    uuid?: string;
    generatedConversions?: Record<string, string>;
  }): Promise<Media> {
    const uuid = opts.uuid ?? uuidv4();
    return this.prisma.media.create({
      data: {
        model_type: opts.modelType,
        model_id: Number(opts.modelId),
        uuid,
        collection_name: opts.collection,
        name: opts.name ?? opts.fileName,
        file_name: opts.fileName,
        mime_type: opts.mimeType,
        disk: opts.disk ?? config.storage.driver,
        size: BigInt(opts.size),
        manipulations: "{}",
        custom_properties: JSON.stringify(opts.customProperties ?? {}),
        generated_conversions: JSON.stringify(opts.generatedConversions ?? {}),
        responsive_images: "{}",
      },
    });
  }

  listByModel(modelType: string, modelId: number) {
    return this.prisma.media.findMany({
      where: { model_type: modelType, model_id: Number(modelId) },
      orderBy: { order_column: "asc" },
    });
  }

  urlFor(
    media: {
      file_name: string;
      model_type: string;
      model_id: number;
      collection_name: string;
      generated_conversions?: string;
    },
    conversion?: string
  ): string {
    if (conversion) {
      const conversions = media.generated_conversions
        ? (JSON.parse(media.generated_conversions) as Record<string, string>)
        : {};
      const convPath = conversions[conversion];
      if (convPath) {
        return this.storage.url(convPath);
      }
    }
    const key = `${media.model_type}/${media.model_id}/${media.collection_name}/${media.file_name}`;
    return this.storage.url(key);
  }

  async getFirstUrl(
    modelType: string,
    modelId: number,
    collection: string,
    conversion?: string
  ): Promise<string> {
    const media = await this.prisma.media.findFirst({
      where: {
        model_type: modelType,
        model_id: Number(modelId),
        collection_name: collection,
      },
    });
    if (!media) {
      const cfg = this.collections[collection];
      return cfg?.fallbackUrl ?? "";
    }
    return this.urlFor(media, conversion);
  }

  async delete(id: number | bigint): Promise<void> {
    const media = await this.prisma.media.findUnique({
      where: { id: BigInt(id) },
    });
    if (!media) return;
    const key = `${media.model_type}/${media.model_id}/${media.collection_name}/${media.file_name}`;
    await this.storage.delete(key);
    if (media.generated_conversions) {
      const convs = JSON.parse(media.generated_conversions) as Record<
        string,
        string
      >;
      for (const p of Object.values(convs)) {
        await this.storage.delete(p);
      }
    }
    await this.prisma.media.delete({ where: { id: BigInt(id) } });
  }

  async updateCustomProps(
    id: number | bigint,
    props: Record<string, unknown>
  ): Promise<void> {
    await this.prisma.media.update({
      where: { id: BigInt(id) },
      data: { custom_properties: JSON.stringify(props) },
    });
  }

  private async generateConversion(
    buffer: Buffer,
    conv: MediaConversion
  ): Promise<Buffer> {
    let img = sharp(buffer);
    if (conv.width || conv.height) {
      img = img.resize(conv.width, conv.height);
    }
    return img.toBuffer();
  }

  private conversionPath(
    opts: AttachFileOptions,
    uuid: string,
    conv: MediaConversion,
    ext: string
  ): string {
    return `${opts.modelType}/${opts.modelId}/${opts.collection}/conversions/${uuid}-${conv.name}${ext}`;
  }
}

const prisma = new PrismaClient();
export const mediaService = new MediaService(
  prisma,
  createStorage(),
  mediaCollections
);

export function mediaable(model: { id: number; __type: string }) {
  const all = async (collection?: string) => {
    const list = await mediaService.listByModel(model.__type, model.id);
    return collection
      ? list.filter((m) => m.collection_name === collection)
      : list;
  };
  const first = async (collection?: string) => {
    const list = await all(collection);
    return list.length ? list[0] : null;
  };
  const firstUrl = async (collection?: string, conversion?: string) => {
    const m = await first(collection);
    return m ? mediaService.urlFor(m, conversion) : null;
  };
  const urls = async (collection?: string, conversion?: string) => {
    const list = await all(collection);
    return list.map((m) => mediaService.urlFor(m, conversion));
  };
  return { all, first, firstUrl, urls };
}
