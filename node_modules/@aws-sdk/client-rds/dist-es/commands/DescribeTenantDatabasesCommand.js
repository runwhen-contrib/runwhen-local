import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { TenantDatabasesMessageFilterSensitiveLog, } from "../models/models_1";
import { de_DescribeTenantDatabasesCommand, se_DescribeTenantDatabasesCommand } from "../protocols/Aws_query";
export { $Command };
export class DescribeTenantDatabasesCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonRDSv19", "DescribeTenantDatabases", {})
    .n("RDSClient", "DescribeTenantDatabasesCommand")
    .f(void 0, TenantDatabasesMessageFilterSensitiveLog)
    .ser(se_DescribeTenantDatabasesCommand)
    .de(de_DescribeTenantDatabasesCommand)
    .build() {
}
