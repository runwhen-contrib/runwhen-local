import { Paginator } from "@smithy/types";
import {
  DescribeVpcEndpointConnectionsCommandInput,
  DescribeVpcEndpointConnectionsCommandOutput,
} from "../commands/DescribeVpcEndpointConnectionsCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
export declare const paginateDescribeVpcEndpointConnections: (
  config: EC2PaginationConfiguration,
  input: DescribeVpcEndpointConnectionsCommandInput,
  ...rest: any[]
) => Paginator<DescribeVpcEndpointConnectionsCommandOutput>;
