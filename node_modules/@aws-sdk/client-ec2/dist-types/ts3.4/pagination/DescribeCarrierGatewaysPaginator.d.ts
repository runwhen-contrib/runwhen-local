import { Paginator } from "@smithy/types";
import {
  DescribeCarrierGatewaysCommandInput,
  DescribeCarrierGatewaysCommandOutput,
} from "../commands/DescribeCarrierGatewaysCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
export declare const paginateDescribeCarrierGateways: (
  config: EC2PaginationConfiguration,
  input: DescribeCarrierGatewaysCommandInput,
  ...rest: any[]
) => Paginator<DescribeCarrierGatewaysCommandOutput>;
