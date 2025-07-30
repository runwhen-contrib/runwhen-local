import { Paginator } from "@smithy/types";
import {
  DescribeIpamResourceDiscoveryAssociationsCommandInput,
  DescribeIpamResourceDiscoveryAssociationsCommandOutput,
} from "../commands/DescribeIpamResourceDiscoveryAssociationsCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
export declare const paginateDescribeIpamResourceDiscoveryAssociations: (
  config: EC2PaginationConfiguration,
  input: DescribeIpamResourceDiscoveryAssociationsCommandInput,
  ...rest: any[]
) => Paginator<DescribeIpamResourceDiscoveryAssociationsCommandOutput>;
