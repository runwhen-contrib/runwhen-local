import { Paginator } from "@smithy/types";
import {
  DescribeTrafficMirrorSessionsCommandInput,
  DescribeTrafficMirrorSessionsCommandOutput,
} from "../commands/DescribeTrafficMirrorSessionsCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
export declare const paginateDescribeTrafficMirrorSessions: (
  config: EC2PaginationConfiguration,
  input: DescribeTrafficMirrorSessionsCommandInput,
  ...rest: any[]
) => Paginator<DescribeTrafficMirrorSessionsCommandOutput>;
