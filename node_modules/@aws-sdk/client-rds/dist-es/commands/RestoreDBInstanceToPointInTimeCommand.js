import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { de_RestoreDBInstanceToPointInTimeCommand, se_RestoreDBInstanceToPointInTimeCommand, } from "../protocols/Aws_query";
export { $Command };
export class RestoreDBInstanceToPointInTimeCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonRDSv19", "RestoreDBInstanceToPointInTime", {})
    .n("RDSClient", "RestoreDBInstanceToPointInTimeCommand")
    .f(void 0, void 0)
    .ser(se_RestoreDBInstanceToPointInTimeCommand)
    .de(de_RestoreDBInstanceToPointInTimeCommand)
    .build() {
}
