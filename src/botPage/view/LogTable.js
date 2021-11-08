import json2csv from 'json2csv';
import React from 'react';
import ReactDataGrid from 'react-data-grid';
import { observer as globalObserver } from '../../common/utils/observer';
import { translate } from '../../common/i18n';
import { appendRow, saveAs } from './shared';

const ColorFormatter = React.forwardRef((props, ref) => (
    <div className={props.row.type}>
        <ReactDataGrid.Row ref={ref} {...props} />
    </div>
));

const LogTable = () => {
    const [id, setId] = React.useState(0);
    const [rows, setRows] = React.useState([]);
    const grid = React.useRef(null);

    const columns = [
        { key: 'timestamp', width: 150, resizable: true, name: translate('Timestamp') },
        { key: 'message', resizable: true, width: 640, name: translate('Message') },
    ];
    const min_height = 550;

    React.useEffect(() => {
        globalObserver.register('log.export', exportLogs);
        globalObserver.register('bot.notify', onGetNotification);
        return () => {
            globalObserver.unregister('log.export', exportLogs);
            globalObserver.unregister('bot.notify', onGetNotification);
        };
    }, [rows]);

    React.useEffect(() => {
        const height = grid.current.getRowOffsetHeight() * id;
        const gridCanvas = grid.current.getDataGridDOMNode().querySelector('.react-grid-Canvas');
        if (!gridCanvas) return;
        gridCanvas.style.scrollBehavior = 'smooth';
        gridCanvas.scrollTop = gridCanvas.scrollHeight;
    }, [rows.length]);

    const onGetNotification = log => {
        if (!log || !Object.keys(log).length) return;

        const row = appendRow(log, { id, rows });
        setRows(row.rows);
        setId(row.id);
    };

    const exportLogs = () => {
        const data = json2csv({ data: rows, fields: ['timestamp', 'message'] });
        saveAs({ data, filename: 'logs.csv', type: 'text/csv;charset=utf-8' });
    };

    const rowGetter = i => rows[i];

    return (
        <div className="content-row">
            <div>
                <div className="content-row-table">
                    <div style={{ height: min_height }}>
                        <ReactDataGrid
                            ref={grid}
                            columns={columns}
                            rowGetter={rowGetter}
                            rowsCount={rows.length}
                            minHeight={min_height}
                            rowRenderer={<ColorFormatter />}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LogTable;
