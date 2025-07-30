import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { DeleteTenantDatabaseResultFilterSensitiveLog, } from "../models/models_1";
import { de_DeleteTenantDatabaseCommand, se_DeleteTenantDatabaseCommand } from "../protocols/Aws_query";
export { $Command };
export class DeleteTenantDatabaseCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonRDSv19", "DeleteTenantDatabase", {})
    .n("RDSClient", "DeleteTenantDatabaseCommand")
    .f(void 0, DeleteTenantDatabaseResultFilterSensitiveLog)
    .ser(se_DeleteTenantDatabaseCommand)
    .de(de_DeleteTenantDatabaseCommand)
    .build() {
}
