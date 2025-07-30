import { Paginator } from "@smithy/types";
import {
  DescribeTransitGatewayConnectPeersCommandInput,
  DescribeTransitGatewayConnectPeersCommandOutput,
} from "../commands/DescribeTransitGatewayConnectPeersCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
export declare const paginateDescribeTransitGatewayConnectPeers: (
  config: EC2PaginationConfiguration,
  input: DescribeTransitGatewayConnectPeersCommandInput,
  ...rest: any[]
) => Paginator<DescribeTransitGatewayConnectPeersCommandOutput>;
