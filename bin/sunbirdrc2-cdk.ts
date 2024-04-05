#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { Sunbirdrc2CdkStack } from '../lib/sunbirdrc2-cdk-stack';

const app = new cdk.App();
new Sunbirdrc2CdkStack(app, 'Sunbirdrc2CdkStack');
