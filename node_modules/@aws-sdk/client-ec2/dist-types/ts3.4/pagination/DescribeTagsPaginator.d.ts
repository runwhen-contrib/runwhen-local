import { Paginator } from "@smithy/types";
import {
  DescribeTagsCommandInput,
  DescribeTagsCommandOutput,
} from "../commands/DescribeTagsCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
export declare const paginateDescribeTags: (
  config: EC2PaginationConfiguration,
  input: DescribeTagsCommandInput,
  ...rest: any[]
) => Paginator<DescribeTagsCommandOutput>;
