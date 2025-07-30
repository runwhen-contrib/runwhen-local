import { Paginator } from "@smithy/types";
import {
  DescribeFlowLogsCommandInput,
  DescribeFlowLogsCommandOutput,
} from "../commands/DescribeFlowLogsCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
export declare const paginateDescribeFlowLogs: (
  config: EC2PaginationConfiguration,
  input: DescribeFlowLogsCommandInput,
  ...rest: any[]
) => Paginator<DescribeFlowLogsCommandOutput>;
