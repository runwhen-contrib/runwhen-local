import { Paginator } from "@smithy/types";
import {
  DescribeVpcPeeringConnectionsCommandInput,
  DescribeVpcPeeringConnectionsCommandOutput,
} from "../commands/DescribeVpcPeeringConnectionsCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
export declare const paginateDescribeVpcPeeringConnections: (
  config: EC2PaginationConfiguration,
  input: DescribeVpcPeeringConnectionsCommandInput,
  ...rest: any[]
) => Paginator<DescribeVpcPeeringConnectionsCommandOutput>;
