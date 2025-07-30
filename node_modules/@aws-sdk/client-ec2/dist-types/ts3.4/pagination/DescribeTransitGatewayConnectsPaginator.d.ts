import { Paginator } from "@smithy/types";
import {
  DescribeTransitGatewayConnectsCommandInput,
  DescribeTransitGatewayConnectsCommandOutput,
} from "../commands/DescribeTransitGatewayConnectsCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
export declare const paginateDescribeTransitGatewayConnects: (
  config: EC2PaginationConfiguration,
  input: DescribeTransitGatewayConnectsCommandInput,
  ...rest: any[]
) => Paginator<DescribeTransitGatewayConnectsCommandOutput>;
