import { Paginator } from "@smithy/types";
import {
  DescribeRouteServersCommandInput,
  DescribeRouteServersCommandOutput,
} from "../commands/DescribeRouteServersCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
export declare const paginateDescribeRouteServers: (
  config: EC2PaginationConfiguration,
  input: DescribeRouteServersCommandInput,
  ...rest: any[]
) => Paginator<DescribeRouteServersCommandOutput>;
