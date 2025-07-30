import { Paginator } from "@smithy/types";
import {
  DescribeTransitGatewaysCommandInput,
  DescribeTransitGatewaysCommandOutput,
} from "../commands/DescribeTransitGatewaysCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
export declare const paginateDescribeTransitGateways: (
  config: EC2PaginationConfiguration,
  input: DescribeTransitGatewaysCommandInput,
  ...rest: any[]
) => Paginator<DescribeTransitGatewaysCommandOutput>;
