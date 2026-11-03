"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const utility_1 = require("./utility");
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            throwIfError((0, utility_1.execSync)("az", "--version"));
            let creds = core.getInput('creds', { required: true });
            core.setSecret(creds);
            let credsObject;
            try {
                credsObject = JSON.parse(creds);
            }
            catch (ex) {
                throw new Error('Credentials object is not a valid JSON');
            }
            if (!credsObject || typeof credsObject !== 'object' || Array.isArray(credsObject)) {
                throw new Error('Credentials object must be a JSON object');
            }
            let servicePrincipalId = credsObject["clientId"];
            let servicePrincipalKey = credsObject["clientSecret"];
            let tenantId = credsObject["tenantId"];
            let subscriptionId = credsObject["subscriptionId"];
            if (![servicePrincipalId, servicePrincipalKey, tenantId, subscriptionId].every(value => typeof value === 'string' && value.trim().length > 0)) {
                throw new Error("Not all values are present in the creds object. Ensure clientId, clientSecret, tenantId and subscriptionId are supplied");
            }
            core.setSecret(servicePrincipalKey);
            let option = {
                silent: true,
                outStream: process.stdout,
                errStream: process.stderr
            };
            throwIfError((0, utility_1.execSync)("az", ["login", "--service-principal", "-u", servicePrincipalId, "-p", servicePrincipalKey, "--tenant", tenantId], option));
            throwIfError((0, utility_1.execSync)("az", ["account", "set", "--subscription", subscriptionId], option));
            console.log("Login successful.");
        }
        catch (error) {
            console.log("Login failed. Please check the credentials.");
            core.setFailed(error);
        }
        finally {
            core.warning('This legacy action is deprecated. Update your workflows to use azure/login@v2.');
        }
    });
}
function throwIfError(resultOfToolExecution, errormsg) {
    if (resultOfToolExecution.code != 0) {
        core.error("Error Code: [" + resultOfToolExecution.code + "]");
        if (errormsg) {
            core.error("Error: " + errormsg);
        }
        throw resultOfToolExecution;
    }
}
main();
