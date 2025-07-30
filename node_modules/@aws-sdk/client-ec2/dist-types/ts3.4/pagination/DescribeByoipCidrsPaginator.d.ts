import { Paginator } from "@smithy/types";
import {
  DescribeByoipCidrsCommandInput,
  DescribeByoipCidrsCommandOutput,
} from "../commands/DescribeByoipCidrsCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
export declare const paginateDescribeByoipCidrs: (
  config: EC2PaginationConfiguration,
  input: DescribeByoipCidrsCommandInput,
  ...rest: any[]
) => Paginator<DescribeByoipCidrsCommandOutput>;
