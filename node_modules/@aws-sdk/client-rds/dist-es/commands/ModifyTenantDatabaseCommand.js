import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { ModifyTenantDatabaseMessageFilterSensitiveLog, ModifyTenantDatabaseResultFilterSensitiveLog, } from "../models/models_1";
import { de_ModifyTenantDatabaseCommand, se_ModifyTenantDatabaseCommand } from "../protocols/Aws_query";
export { $Command };
export class ModifyTenantDatabaseCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonRDSv19", "ModifyTenantDatabase", {})
    .n("RDSClient", "ModifyTenantDatabaseCommand")
    .f(ModifyTenantDatabaseMessageFilterSensitiveLog, ModifyTenantDatabaseResultFilterSensitiveLog)
    .ser(se_ModifyTenantDatabaseCommand)
    .de(de_ModifyTenantDatabaseCommand)
    .build() {
}
