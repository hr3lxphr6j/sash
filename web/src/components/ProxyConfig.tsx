// Copyright 2019 Samaritan Authors
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import {HealthCheckerType, LbPolicy, Protocol, ProxyConfig} from "../models/proxy-config";
import React from "react";
import {Card, Divider, Form, Input, InputNumber, Select} from "antd";
import {FormComponentProps} from "antd/es/form";
import {keys, map} from "ramda";
import TextArea from "antd/es/input/TextArea";

interface ProxyConfigProps extends FormComponentProps {
    proxyConfig?: ProxyConfig
}

interface ProxyConfigState {
    selectedChecker: HealthCheckerType
    selectedProtocol: Protocol
}

class ProxyConfigDetail extends React.Component<ProxyConfigProps, ProxyConfigState> {
    state = {
        selectedChecker: HealthCheckerType.TCP,
        selectedProtocol: Protocol.TCP
    };

    getHealthyCheckerType(proxyConfig?: ProxyConfig): HealthCheckerType {
        if (proxyConfig && proxyConfig.config && proxyConfig.config.healthCheck) {
            let {healthCheck} = proxyConfig.config;
            if (healthCheck.redisChecker) {
                console.log("Redis");
                return HealthCheckerType.Redis
            }
            if (healthCheck.atcpChecker) {
                console.log("ATCP");
                return HealthCheckerType.ATCP
            }
            if (healthCheck.mysqlChecker) {
                console.log("MySQL");
                return HealthCheckerType.MySQL
            }
        }
        return HealthCheckerType.TCP
    }

    constructor(props: ProxyConfigProps) {
        super(props);
    }

    componentWillReceiveProps(nextProps: Readonly<ProxyConfigProps>, nextContext: any): void {
        this.setState({
            selectedChecker: this.getHealthyCheckerType(nextProps.proxyConfig),
            selectedProtocol: nextProps.proxyConfig && nextProps.proxyConfig.config ? nextProps.proxyConfig.config.protocol : Protocol.TCP
        })
    }

    genCheckerItems(): React.ReactNode {
        const childrenFormItemLayout = {
            labelCol: {span: 2},
            wrapperCol: {span: 7},
        };
        const cardItemLayout = {
            labelCol: {span: 4},
            wrapperCol: {span: 18},
        };
        const {selectedChecker} = this.state;
        switch (selectedChecker) {
            case HealthCheckerType.TCP: {
                return null;
            }
            case HealthCheckerType.ATCP: {
                return (
                    <h1>ATCP</h1>
                );
            }
            case HealthCheckerType.MySQL: {
                return (
                    <Form.Item label="Checker Config" {...cardItemLayout}>
                        <Card title="MySQL Checker Config" size="small">
                            <Form.Item label="Username" {...childrenFormItemLayout}>
                                {this.props.form.getFieldDecorator("healthCheck.mysqlChecker.username", {
                                    initialValue: this.props.proxyConfig &&
                                    this.props.proxyConfig.config &&
                                    this.props.proxyConfig.config.healthCheck &&
                                    this.props.proxyConfig.config.healthCheck.mysqlChecker ?
                                        this.props.proxyConfig.config.healthCheck.mysqlChecker.username : undefined
                                })(<Input allowClear/>)}
                            </Form.Item>
                        </Card>
                    </Form.Item>
                );
            }
            case HealthCheckerType.Redis: {
                return (
                    <Form.Item label="Checker Config" {...cardItemLayout}>
                        <Card title="Redis Checker Config" size="small">
                            <Form.Item label="Password" {...childrenFormItemLayout}>
                                {this.props.form.getFieldDecorator("healthCheck.redisChecker.password", {
                                    initialValue: this.props.proxyConfig &&
                                    this.props.proxyConfig.config &&
                                    this.props.proxyConfig.config.healthCheck &&
                                    this.props.proxyConfig.config.healthCheck.redisChecker ?
                                        this.props.proxyConfig.config.healthCheck.redisChecker.password : undefined
                                })(<Input allowClear/>)}
                            </Form.Item>
                        </Card>
                    </Form.Item>
                );
            }
        }
    }

    render() {
        const formItemLayout = {
            labelCol: {span: 4},
            wrapperCol: {span: 8},
        };
        const {selectedChecker, selectedProtocol} = this.state;
        const {form, proxyConfig} = this.props;
        const {getFieldDecorator} = form;
        return (
            <Form layout="horizontal" style={{textAlign: 'left'}}>
                <Form.Item label="Name" {...formItemLayout}>
                    {getFieldDecorator("name", {
                        initialValue: proxyConfig ? proxyConfig.service_name : undefined
                    })(<Input disabled={proxyConfig != null}/>)}
                </Form.Item>
                <Divider orientation="left">Listener</Divider>
                <Form.Item label="Address" {...formItemLayout}>
                    {getFieldDecorator("listener.address", {
                        initialValue: proxyConfig && proxyConfig.config ?
                            proxyConfig.config.listener.address.ip + ":" + proxyConfig.config.listener.address.port : undefined
                    })(<Input allowClear/>)}
                </Form.Item>
                <Form.Item label="Connection Limit" {...formItemLayout}>
                    {getFieldDecorator("listener.connectionLimit", {
                        initialValue: proxyConfig && proxyConfig.config ?
                            proxyConfig.config.listener.connectionLimit : 0
                    })(<InputNumber min={0}/>)}
                </Form.Item>

                <Divider orientation="left">Load Balance</Divider>
                <Form.Item label="Policy" {...formItemLayout}>
                    <Select defaultValue={LbPolicy.LEAST_CONNECTION}>
                        {map(v => (<Select.Option key={v}>{v}</Select.Option>), keys(LbPolicy))}
                    </Select>
                </Form.Item>

                <Divider orientation="left">Healthy Check</Divider>
                <Form.Item label="Interval" {...formItemLayout}>
                    {getFieldDecorator("healthCheck.interval", {
                        initialValue: proxyConfig && proxyConfig.config && proxyConfig.config.healthCheck ?
                            proxyConfig.config.healthCheck.interval : undefined
                    })(<Input allowClear/>)}
                </Form.Item>
                <Form.Item label="Timeout" {...formItemLayout}>
                    {getFieldDecorator("healthCheck.timeout", {
                        initialValue: proxyConfig && proxyConfig.config && proxyConfig.config.healthCheck ?
                            proxyConfig.config.healthCheck.timeout : undefined
                    })(<Input allowClear/>)}
                </Form.Item>
                <Form.Item label="FallThreshold" {...formItemLayout}>
                    {getFieldDecorator("healthCheck.fallThreshold", {
                        initialValue: proxyConfig && proxyConfig.config && proxyConfig.config.healthCheck ?
                            proxyConfig.config.healthCheck.fallThreshold : undefined
                    })(<InputNumber min={0}/>)}
                </Form.Item>
                <Form.Item label="RiseThreshold" {...formItemLayout}>
                    {getFieldDecorator("healthCheck.riseThreshold", {
                        initialValue: proxyConfig && proxyConfig.config && proxyConfig.config.healthCheck ?
                            proxyConfig.config.healthCheck.riseThreshold : undefined
                    })(<InputNumber min={0}/>)}
                </Form.Item>
                <Form.Item label="Checker" {...formItemLayout}>
                    <Select value={selectedChecker}
                            onSelect={(value: HealthCheckerType) => this.setState({selectedChecker: value})}>
                        {map(v => (<Select.Option key={v}>{v}</Select.Option>), keys(HealthCheckerType))}
                    </Select>
                </Form.Item>

                {this.genCheckerItems()}


                <Divider orientation="left">Common</Divider>
                <Form.Item label="ConnectTimeout" {...formItemLayout}>
                    {getFieldDecorator("connectTimeout", {
                        initialValue: proxyConfig && proxyConfig.config ?
                            proxyConfig.config.connectTimeout : undefined
                    })(<Input allowClear/>)}
                </Form.Item>
                <Form.Item label="IdleTimeout" {...formItemLayout}>
                    {getFieldDecorator("idleTimeout", {
                        initialValue: proxyConfig && proxyConfig.config ?
                            proxyConfig.config.idleTimeout : undefined
                    })(<Input allowClear/>)}
                </Form.Item>

                <Divider orientation="left">Protocol</Divider>
                <Form.Item label="Protocol" {...formItemLayout}>
                    <Select value={selectedProtocol}
                            onSelect={(value: Protocol) => this.setState({selectedProtocol: value})}>
                        {map(v => (<Select.Option key={v}>{v}</Select.Option>), keys(Protocol))}
                    </Select>
                </Form.Item>
                <Form.Item label="Option" {...formItemLayout}>
                    {getFieldDecorator("protoOption", {
                        initialValue: proxyConfig && proxyConfig.config ?
                            proxyConfig.config.tcpOption ? JSON.stringify(proxyConfig.config.tcpOption) :
                                proxyConfig.config.redisOption ? JSON.stringify(proxyConfig.config.redisOption) :
                                    proxyConfig.config.mysqlOption ? JSON.stringify(proxyConfig.config.mysqlOption) :
                                        undefined : undefined
                    })(<TextArea/>)}

                </Form.Item>
            </Form>
        )
    }
}

export default Form.create<ProxyConfigProps>({})(ProxyConfigDetail);
