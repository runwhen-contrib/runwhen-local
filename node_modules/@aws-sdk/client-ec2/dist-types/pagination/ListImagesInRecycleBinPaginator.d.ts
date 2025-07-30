import { Paginator } from "@smithy/types";
import { ListImagesInRecycleBinCommandInput, ListImagesInRecycleBinCommandOutput } from "../commands/ListImagesInRecycleBinCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
/**
 * @public
 */
export declare const paginateListImagesInRecycleBin: (config: EC2PaginationConfiguration, input: ListImagesInRecycleBinCommandInput, ...rest: any[]) => Paginator<ListImagesInRecycleBinCommandOutput>;
