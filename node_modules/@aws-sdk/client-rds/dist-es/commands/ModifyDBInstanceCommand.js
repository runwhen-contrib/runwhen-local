import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { de_ModifyDBInstanceCommand, se_ModifyDBInstanceCommand } from "../protocols/Aws_query";
export { $Command };
export class ModifyDBInstanceCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonRDSv19", "ModifyDBInstance", {})
    .n("RDSClient", "ModifyDBInstanceCommand")
    .f(void 0, void 0)
    .ser(se_ModifyDBInstanceCommand)
    .de(de_ModifyDBInstanceCommand)
    .build() {
}
