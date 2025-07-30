import { Paginator } from "@smithy/types";
import { DescribeIamInstanceProfileAssociationsCommandInput, DescribeIamInstanceProfileAssociationsCommandOutput } from "../commands/DescribeIamInstanceProfileAssociationsCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
/**
 * @public
 */
export declare const paginateDescribeIamInstanceProfileAssociations: (config: EC2PaginationConfiguration, input: DescribeIamInstanceProfileAssociationsCommandInput, ...rest: any[]) => Paginator<DescribeIamInstanceProfileAssociationsCommandOutput>;
