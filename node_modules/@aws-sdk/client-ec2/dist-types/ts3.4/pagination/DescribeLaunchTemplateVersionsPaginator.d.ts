import { Paginator } from "@smithy/types";
import {
  DescribeLaunchTemplateVersionsCommandInput,
  DescribeLaunchTemplateVersionsCommandOutput,
} from "../commands/DescribeLaunchTemplateVersionsCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
export declare const paginateDescribeLaunchTemplateVersions: (
  config: EC2PaginationConfiguration,
  input: DescribeLaunchTemplateVersionsCommandInput,
  ...rest: any[]
) => Paginator<DescribeLaunchTemplateVersionsCommandOutput>;
