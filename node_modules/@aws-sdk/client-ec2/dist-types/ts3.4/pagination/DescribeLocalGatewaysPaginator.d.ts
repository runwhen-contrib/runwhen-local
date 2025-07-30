import { Paginator } from "@smithy/types";
import {
  DescribeLocalGatewaysCommandInput,
  DescribeLocalGatewaysCommandOutput,
} from "../commands/DescribeLocalGatewaysCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
export declare const paginateDescribeLocalGateways: (
  config: EC2PaginationConfiguration,
  input: DescribeLocalGatewaysCommandInput,
  ...rest: any[]
) => Paginator<DescribeLocalGatewaysCommandOutput>;
