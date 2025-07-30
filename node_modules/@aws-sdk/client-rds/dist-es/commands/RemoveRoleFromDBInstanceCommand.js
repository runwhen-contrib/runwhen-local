import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { de_RemoveRoleFromDBInstanceCommand, se_RemoveRoleFromDBInstanceCommand } from "../protocols/Aws_query";
export { $Command };
export class RemoveRoleFromDBInstanceCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonRDSv19", "RemoveRoleFromDBInstance", {})
    .n("RDSClient", "RemoveRoleFromDBInstanceCommand")
    .f(void 0, void 0)
    .ser(se_RemoveRoleFromDBInstanceCommand)
    .de(de_RemoveRoleFromDBInstanceCommand)
    .build() {
}
