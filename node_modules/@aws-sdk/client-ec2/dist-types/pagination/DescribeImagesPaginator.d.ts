import { Paginator } from "@smithy/types";
import { DescribeImagesCommandInput, DescribeImagesCommandOutput } from "../commands/DescribeImagesCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
/**
 * @public
 */
export declare const paginateDescribeImages: (config: EC2PaginationConfiguration, input: DescribeImagesCommandInput, ...rest: any[]) => Paginator<DescribeImagesCommandOutput>;
