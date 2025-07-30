import { PaginationConfiguration } from "@smithy/types";
import { RDSClient } from "../RDSClient";
export interface RDSPaginationConfiguration extends PaginationConfiguration {
  client: RDSClient;
}
