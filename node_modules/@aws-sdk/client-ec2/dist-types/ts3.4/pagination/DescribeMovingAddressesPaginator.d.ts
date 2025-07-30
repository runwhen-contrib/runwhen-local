import { Paginator } from "@smithy/types";
import {
  DescribeMovingAddressesCommandInput,
  DescribeMovingAddressesCommandOutput,
} from "../commands/DescribeMovingAddressesCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
export declare const paginateDescribeMovingAddresses: (
  config: EC2PaginationConfiguration,
  input: DescribeMovingAddressesCommandInput,
  ...rest: any[]
) => Paginator<DescribeMovingAddressesCommandOutput>;
