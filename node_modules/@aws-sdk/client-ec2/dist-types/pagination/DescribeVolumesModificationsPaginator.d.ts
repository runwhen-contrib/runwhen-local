import { Paginator } from "@smithy/types";
import { DescribeVolumesModificationsCommandInput, DescribeVolumesModificationsCommandOutput } from "../commands/DescribeVolumesModificationsCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
/**
 * @public
 */
export declare const paginateDescribeVolumesModifications: (config: EC2PaginationConfiguration, input: DescribeVolumesModificationsCommandInput, ...rest: any[]) => Paginator<DescribeVolumesModificationsCommandOutput>;
