import { Paginator } from "@smithy/types";
import {
  DescribeVolumesCommandInput,
  DescribeVolumesCommandOutput,
} from "../commands/DescribeVolumesCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
export declare const paginateDescribeVolumes: (
  config: EC2PaginationConfiguration,
  input: DescribeVolumesCommandInput,
  ...rest: any[]
) => Paginator<DescribeVolumesCommandOutput>;
