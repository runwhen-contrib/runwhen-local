import { Paginator } from "@smithy/types";
import { DescribeFpgaImagesCommandInput, DescribeFpgaImagesCommandOutput } from "../commands/DescribeFpgaImagesCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
/**
 * @public
 */
export declare const paginateDescribeFpgaImages: (config: EC2PaginationConfiguration, input: DescribeFpgaImagesCommandInput, ...rest: any[]) => Paginator<DescribeFpgaImagesCommandOutput>;
