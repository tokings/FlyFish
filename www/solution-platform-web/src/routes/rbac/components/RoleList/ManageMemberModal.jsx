import PropTypes from 'prop-types';
import T from 'utils/T';
import BoxContent from 'templates/ToolComponents/BoxContent';

import { PureComponent } from 'react';
import { Modal, Transfer, Row, Col } from 'antd';

import { doGetAllUserAndRoleUser, doUpdateRoleMember } from '../../action/role';

@T.decorator.propTypes({
    role_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
})
export default class ManageMemberModal extends PureComponent {
    state = {
        visible: false,
        saving: false,
    };

    /**
     * 成员管理ref对象
     * @type {null}
     */
    refMember = null;

    componentDidMount() {
        this.showModal();
    }

    showModal = () => this.setState({ visible: true });

    handleCancel = () => this.setState({ visible: false });

    /**
     * 执行创建或编辑
     */
    handleSave = () => {
        this.setState({ saving: true }, () => {
            const { role_id, addUsers, delUsers } = this.refMember.getData();
            doUpdateRoleMember(role_id, addUsers, delUsers).then(() => {
                T.prompt.success('操作成功');
                this.setState({ saving: false, visible: false });
            }, (resp) => {
                T.prompt.error(resp.msg);
                this.setState({ saving: false, visible: false });
            });
        });
    }

    render() {
        const { visible, saving } = this.state;
        const { role_id } = this.props;
        return (
            <Modal
                width={900}
                visible={visible}
                title="管理成员"
                okText="确定"
                cancelText="取消"
                confirmLoading={saving}
                onCancel={this.handleCancel}
                onOk={this.handleSave}
            >
                <Row type="flex" justify="center">
                    <Col>
                        <ManageMember role_id={parseInt(role_id)} ref={(refMember) => this.refMember = refMember} />
                    </Col>
                </Row>
            </Modal>
        );
    }
}


@T.decorator.propTypes({
    role_id: PropTypes.number.isRequired
})
class ManageMember extends PureComponent {
    state = {
        loading: false,
        userOutGroup: [],
        userIdInGroup: [],
    };

    /**
     * 原始组内成员
     * @type {Array}
     */
    originUserIdInGroup = [];

    componentDidMount() {
        this.setState({ loading: true }, () => {
            doGetAllUserAndRoleUser(this.props.role_id).then((resp) => {
                const [allUser, roleUser] = resp;
                this.setState({
                    loading: false,
                    userOutGroup: allUser.data.map((item) => ({
                        key: item.user_id,
                        disabled: item.user_id === 1,
                        userName: item.user_name,
                        userEmail: item.user_email
                    })),
                    userIdInGroup: roleUser.data.map(item => item.user_id)
                }, () => this.originUserIdInGroup = T.lodash.clone(this.state.userIdInGroup));


            }, (resp) => {
                T.prompt.error(resp.msg);
                this.setState({ loading: false });
            });
        });

    }

    getData() {
        return {
            role_id: this.props.role_id,
            delUsers: T.lodash.difference(this.originUserIdInGroup, this.state.userIdInGroup),
            addUsers: T.lodash.difference(this.state.userIdInGroup, this.originUserIdInGroup),
        };
    }

    render() {
        const { loading, userIdInGroup, userOutGroup } = this.state;

        return (
            <BoxContent loading={loading}>
                <Transfer
                    dataSource={userOutGroup}
                    showSearch
                    listStyle={{
                        width: 350,
                        height: 300,
                    }}
                    titles={['待添加成员', '已添加成员']}
                    searchPlaceholder="搜索成员"
                    operations={['添加', '移除']}
                    targetKeys={userIdInGroup}
                    onChange={(userIdInGroup) => this.setState({ userIdInGroup })}
                    render={item => `${item.userName}-${item.userEmail}`}
                />
            </BoxContent>
        );
    }
}
