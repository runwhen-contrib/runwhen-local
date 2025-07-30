import { Paginator } from "@smithy/types";
import {
  DescribeReplaceRootVolumeTasksCommandInput,
  DescribeReplaceRootVolumeTasksCommandOutput,
} from "../commands/DescribeReplaceRootVolumeTasksCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
export declare const paginateDescribeReplaceRootVolumeTasks: (
  config: EC2PaginationConfiguration,
  input: DescribeReplaceRootVolumeTasksCommandInput,
  ...rest: any[]
) => Paginator<DescribeReplaceRootVolumeTasksCommandOutput>;
