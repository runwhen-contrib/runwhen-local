import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { de_RestoreDBInstanceFromS3Command, se_RestoreDBInstanceFromS3Command } from "../protocols/Aws_query";
export { $Command };
export class RestoreDBInstanceFromS3Command extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonRDSv19", "RestoreDBInstanceFromS3", {})
    .n("RDSClient", "RestoreDBInstanceFromS3Command")
    .f(void 0, void 0)
    .ser(se_RestoreDBInstanceFromS3Command)
    .de(de_RestoreDBInstanceFromS3Command)
    .build() {
}
