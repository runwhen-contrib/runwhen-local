import { Paginator } from "@smithy/types";
import { DescribeLaunchTemplatesCommandInput, DescribeLaunchTemplatesCommandOutput } from "../commands/DescribeLaunchTemplatesCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
/**
 * @public
 */
export declare const paginateDescribeLaunchTemplates: (config: EC2PaginationConfiguration, input: DescribeLaunchTemplatesCommandInput, ...rest: any[]) => Paginator<DescribeLaunchTemplatesCommandOutput>;
