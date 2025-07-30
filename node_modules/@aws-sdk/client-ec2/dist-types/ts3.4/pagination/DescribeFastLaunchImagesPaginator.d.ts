import { Paginator } from "@smithy/types";
import {
  DescribeFastLaunchImagesCommandInput,
  DescribeFastLaunchImagesCommandOutput,
} from "../commands/DescribeFastLaunchImagesCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
export declare const paginateDescribeFastLaunchImages: (
  config: EC2PaginationConfiguration,
  input: DescribeFastLaunchImagesCommandInput,
  ...rest: any[]
) => Paginator<DescribeFastLaunchImagesCommandOutput>;
