import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { CreateTenantDatabaseMessageFilterSensitiveLog, CreateTenantDatabaseResultFilterSensitiveLog, } from "../models/models_0";
import { de_CreateTenantDatabaseCommand, se_CreateTenantDatabaseCommand } from "../protocols/Aws_query";
export { $Command };
export class CreateTenantDatabaseCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonRDSv19", "CreateTenantDatabase", {})
    .n("RDSClient", "CreateTenantDatabaseCommand")
    .f(CreateTenantDatabaseMessageFilterSensitiveLog, CreateTenantDatabaseResultFilterSensitiveLog)
    .ser(se_CreateTenantDatabaseCommand)
    .de(de_CreateTenantDatabaseCommand)
    .build() {
}
