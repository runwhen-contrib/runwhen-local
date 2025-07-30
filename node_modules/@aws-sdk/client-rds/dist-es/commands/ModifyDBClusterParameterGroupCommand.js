import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { de_ModifyDBClusterParameterGroupCommand, se_ModifyDBClusterParameterGroupCommand, } from "../protocols/Aws_query";
export { $Command };
export class ModifyDBClusterParameterGroupCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonRDSv19", "ModifyDBClusterParameterGroup", {})
    .n("RDSClient", "ModifyDBClusterParameterGroupCommand")
    .f(void 0, void 0)
    .ser(se_ModifyDBClusterParameterGroupCommand)
    .de(de_ModifyDBClusterParameterGroupCommand)
    .build() {
}
