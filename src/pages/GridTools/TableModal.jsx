import React, {useEffect, useState} from 'react';
import config from 'src/commons/config-hoc';
import {Content, ModalContent, Table} from '@ra-lib/admin';
import {authority} from "src/commons/common";
import {FormattedMessage} from "react-intl";
import {Card} from "antd";

export default config({
    modal: {
        title: '弹框标题',
        width: '70%',
    },
})(props => {
    const {onOk, onCancel, subTableHeader, subTable, subTableType} = props;
    const [columns, setColumns] = useState([]);
    const [dataSource, setDataSource] = useState([])
    useEffect(async () => {
        let columns = [];
        let dataSource = [];
        if (subTableType == 1) {//json子表格
            subTableHeader.forEach((item, index) => {
                //判断字段权限
                if ((item.access & authority.view) > 0) {
                    let table_column = {
                        key: item.name,
                        title: <FormattedMessage id={item.header} defaultMessage=""/>,
                        dataIndex: item.name,
                        width: 180,
                        align: "center",
                    };
                    columns.push(table_column);
                }

            });
            setColumns(columns);
            setDataSource(JSON.parse(subTable));
        }

    }, []);
    return (
        <ModalContent
            onOk={onOk}
            onCancel={onCancel}
            footer={true}
        >
            <Content otherHeight={100} fitHeight>
                <Table
                    fitHeight
                    dataSource={dataSource}
                    columns={columns}
                    rowKey="{record=>record.Id}"
                />
            </Content>
        </ModalContent>
    );
});