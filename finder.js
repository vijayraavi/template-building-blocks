const path = require('path')
const fs = require('fs');
const childProcess = require('child_process');
const process = require('process');
const os = require('os');

function fromDir(startPath, filter){

    //console.log('Starting from dir '+startPath+'/');

    if (!fs.existsSync(startPath)) {
        console.log("no dir ", startPath);
        return;
    }

    let files = fs.readdirSync(startPath);
    files = files.reduce((acc, curr) => {
        const filename = path.join(startPath, curr);
        const stat = fs.lstatSync(filename);
        if (stat.isDirectory()) {
            acc = acc.concat(fromDir(filename, filter));
        } else if (filename.indexOf(filter) >= 0) {
            acc.push(filename);
        }

        return acc;
    }, []);

    return files;
};

//const directory = 'c:\\Source\\mspnp\\reference-architectures\\virtual-machines';
// const directories = [
//     'c:\\Source\\mspnp\\reference-architectures\\dmz',
//     //'c:\\Source\\mspnp\\reference-architectures\\hybrid-networking',
//     'c:\\Source\\mspnp\\reference-architectures\\hybrid-networking\\hub-spoke',
//     'C:\\Source\\mspnp\\reference-architectures\\hybrid-networking\\shared-services-stack',
//     //'c:\\Source\\mspnp\\reference-architectures\\identity',
//     'c:\\Source\\mspnp\\reference-architectures\\sharepoint',
//     'c:\\Source\\mspnp\\reference-architectures\\virtual-machines'
// ];
const directories = [
    {
        baseDir: 'c:\\Source\\mspnp\\reference-architectures',
        subdirectories: [
            'dmz',
            'hybrid-networking\\hub-spoke',
            'hybrid-networking\\shared-services-stack',
            'sharepoint',
            'virtual-machines'
        ]
    }
];

//const directory = 'c:\\Source\\mspnp\\reference-architectures';
//let files = fromDir(directory, '.json');
const files = directories.reduce((acc, dir) => {
    //acc = acc.concat(fromDir(dir, '.json'));
    // acc.push({
    //     baseDir: dir,
    //     files: fromDir(dir, '.json')
    // });
    acc.push({
        baseDir: dir.baseDir,
        files: dir.subdirectories.reduce((acc2, sd) => {
            acc2 = acc2.concat(fromDir(path.resolve(dir.baseDir, sd), '.json'))
            return acc2;
        }, [])
    });
    return acc;
}, []);

const subscriptionId = '3b518fac-e5c8-4f59-8ed5-d70b626f8e10';
//let exportArgs = files.map(p => {
let exportArgs = files.reduce((acc, curr) => {
    acc = acc.concat(curr.files.map(p => {
        return [
            '.\\src\\index.js',
            '--subscription-id',
            subscriptionId,
            '--resource-group',
            `${path.basename(path.dirname(p))}-rg`,
            '--location',
            'eastus',
            '--parameters-file',
            p,
            '--export',
            '--output-file',
            path.resolve('.\\output', path.relative(curr.baseDir, p))
        ];
    }));

    return acc;
}, []);

//console.log(exportArgs.forEach(args => console.log(args.join(' '), '\n')));

const spawnOptions = {
    // stdio: 'inherit',
    stdio: 'pipe',
    shell: true
};

// args = [
//     //'c:\\Source\\mspnp\\template-building-blocks\\src\\index.js',
//     '.\\src\\index.js',
//     '--subscription-id',
//     '3b518fac-e5c8-4f59-8ed5-d70b626f8e10',
//     '--resource-group',
//     'my-test-bb-rg2',
//     '--location',
//     'eastus',
//     '--parameters-file',
//     'c:\\Source\\mspnp\\reference-architectures\\virtual-machines\\n-tier-linux\\n-tier-linux.json',
//     '--export',
//     '--script-type',
//     'cmd',
//     '--output-file',
//     '.\\output\\n-tier-linux\\n-tier-linux.json'
// ];

// console.log(args.join(' '));
exportArgs.forEach(args => {
    console.log(`Processing ${args[8]}`);
    try {
        let child = childProcess.spawnSync('node', args, spawnOptions);
        if (child.status !== 0) {
            let error = `error executing node${os.EOL}`;
            // If our stdio is 'pipe', we should pull the error message out and show it.
            if (spawnOptions.stdio === 'pipe') {
                error += `  message: ${child.stderr.toString().trim()}${os.EOL}`;
            }

            error += `  status: ${child.status}${os.EOL}  arguments: ${args.join(' ')}`;
            throw new Error(error);
        }

        if (spawnOptions.stdio === 'pipe') {
            // The spawn was successful, but we are debugging, so we need to write the stderr, but only if stdio === 'pipe'
            console.error(child.stderr.toString().trim());
        }

        console.log('Processing complete\n');
    } catch (e) {
        console.log(`Error processing ${args[8]}\n${e}\n`);
    }
});
