import { Paginator } from "@smithy/types";
import {
  DescribePrincipalIdFormatCommandInput,
  DescribePrincipalIdFormatCommandOutput,
} from "../commands/DescribePrincipalIdFormatCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
export declare const paginateDescribePrincipalIdFormat: (
  config: EC2PaginationConfiguration,
  input: DescribePrincipalIdFormatCommandInput,
  ...rest: any[]
) => Paginator<DescribePrincipalIdFormatCommandOutput>;
