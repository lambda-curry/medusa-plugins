import type { Client, ClientHeaders } from '@medusajs/js-sdk';
import FormData from 'form-data';
import { ReadStream } from 'fs';
import type {
  StoreListProductReviewsResponse,
  StoreListProductReviewsQuery,
  StoreListProductReviewStatsQuery,
  StoreListProductReviewStatsResponse,
  StoreUpsertProductReviewsDTO,
  StoreUpsertProductReviewsResponse,
  StoreUploadProductReviewImagesResponse,
  // StoreProductReviewUploadImagesInput,
} from '../../types';
// import { Readable } from 'stream';
// import { AdminUploadFile, HttpTypes } from '@medusajs/types';
// import { HttpTypes } from '@medusajs/types';

export class StoreProductReviewsResource {
  constructor(private client: Client) {}

  async upsert(data: StoreUpsertProductReviewsDTO, headers?: ClientHeaders) {
    return this.client.fetch<StoreUpsertProductReviewsResponse>(`/store/product-reviews`, {
      method: 'POST',
      body: data,
      headers,
    });
  }

  async list(query: StoreListProductReviewsQuery, headers?: ClientHeaders) {
    return this.client.fetch<StoreListProductReviewsResponse>(`/store/product-reviews`, {
      method: 'GET',
      query,
      headers,
    });
  }

  async listStats(query: StoreListProductReviewStatsQuery, headers?: ClientHeaders) {
    return this.client.fetch<StoreListProductReviewStatsResponse>(`/store/product-review-stats`, {
      method: 'GET',
      query,
      headers,
    });
  }

  async uploadImages(images: ReadStream[], headers?: ClientHeaders) {
    const formData = new FormData()

    Array.from(images).forEach((image) => {
      formData.append(
        "files",
        image,
      )
    })
    // const formData = new FormData()

    // await Promise.all(images.map(async (file) => {
    //   const buffer = Buffer.from(await (file as File).arrayBuffer());
    //   formData.append("files", Readable.from(buffer), {
    //     filename: file.name,
    //     contentType: file.type,
    //     // knownLength: buffer.length,
    //   });
    //   console.log("🚀 ~ StoreProductReviewsResource ~ awaitPromise.all ~ file appended:", file.name)
    //   console.log("🚀 ~ StoreProductReviewsResource ~ formData.append ~ formData:", formData)
    // }))

    // images.forEach((file) => {
    //   formData.append(
    //     "files",
    //     "content" in file
    //       ? new Blob([file.content], {
    //           type: "text/plain",
    //         })
    //       : file,
    //     file.name
    //   )
    // })

    return await this.client.fetch<StoreUploadProductReviewImagesResponse>(
      '/store/product-reviews/uploads',
      {
        method: "POST",
        headers: formData.getHeaders(),
        // headers: {
        //   ...headers,
        //   "Content-Type": `multipart/form-data; boundary=${formData.getBoundary()}`,
        // },
        body: formData,
      }
    );
  }

}
