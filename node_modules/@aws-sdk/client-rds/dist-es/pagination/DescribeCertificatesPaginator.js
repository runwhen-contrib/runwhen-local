import { createPaginator } from "@smithy/core";
import { DescribeCertificatesCommand, } from "../commands/DescribeCertificatesCommand";
import { RDSClient } from "../RDSClient";
export const paginateDescribeCertificates = createPaginator(RDSClient, DescribeCertificatesCommand, "Marker", "Marker", "MaxRecords");
