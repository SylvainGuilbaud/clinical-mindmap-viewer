import { Component, OnInit, ViewEncapsulation, Renderer2, AfterViewInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import MindElixir from "mind-elixir";
import painter from 'mind-elixir/dist/painter';
import { BundleEntry, Patient } from 'fhir/r4';
import { FhirService } from '../../service/fhir.service';

@Component({
    providers: [MessageService],
    templateUrl: './mindmap.component.html'
})

export class MindmapComponent implements OnInit {

    patients: BundleEntry<Patient>[] = [];

    selectedPatients: Patient[] = [];

    patientCols: any[] = [];

    display: boolean = false;

    public ME = new MindElixir({
        el: "#map",
        direction: MindElixir.LEFT,
        data: MindElixir.new("new topic"),
        draggable: true, // default true
        contextMenu: true, // default true
        toolBar: true, // default true
        nodeMenu: true, // default true
        keypress: true // default true
      });
      
    constructor(
        private fhirService: FhirService,
        private messageService: MessageService) {
    }

    ngOnInit() {
        this.fhirService.getAllPatients().subscribe(data => this.patients = data.entry!);

        this.patientCols = [
            { field: 'resource.identifier.2.value', header: 'Number' },
            { field: 'resource.birthDate', header: 'Birth Date' },
            { field: 'resource.gender', header: 'Gender' },
            { field: 'patient.resource.name[0].given[0]', header: 'Name' },
            { field: 'patient.resource.name[0].family[0]', header: 'Family Name' }
        ];

        this.ME = new MindElixir({
            el: "#map",
            direction: MindElixir.LEFT,
            data: MindElixir.new("new topic"),
            draggable: true, // default true
            contextMenu: true, // default true
            toolBar: true, // default true
            nodeMenu: true, // default true
            keypress: true // default true
          });
        this.ME.init(MindElixir.new("new topic"));     
        
    }

    getIpAddress() {
        return window.location.hostname;
    }

    getMindmapOptions(dataToRender) {
        return (
            {
                el: '#map',
                direction: MindElixir.SIDE,
                data: dataToRender == null ? MindElixir.new('Novo Mapa') : this.renderExistentMindmap(dataToRender),
                draggable: true, // default true
                contextMenu: true, // default true
                toolBar: true, // default true
                nodeMenu: true, // default true
                keypress: true, // default true
                contextMenuOption: {
                    focus: true,
                    link: true,
                    extend: [
                        {
                            name: 'Export as PNG Image',
                            onclick: () => {
                                painter.exportPng(this.ME, 'mindmap.png')
                            },
                        },
                        {
                            name: 'Export as SVG Image',
                            onclick: () => {
                                painter.exportSvg(this.ME, 'mindmap')
                            },
                        },
                        {
                            name: 'Export as Markdown',
                            onclick: () => {
                                this.downloadMD('mindmap.md', this.ME.getAllDataMd())
                            },
                        },
                    ],
                },
            });

    }

    exportPNG() {
        painter.exportPng(this.ME, 'mindmap.png')
    }

    exportSVG() {
        painter.exportSvg(this.ME, 'mindmap')
    }

    exportMarkdown() {
        this.downloadMD('mindmap.md', this.ME.getAllDataMd())
    }

    renderExistentMindmap(data) {

        let root = data[0]

        let nodeData = {
            id: root.id,
            topic: root.topic,
            root: true,
            style: {
                background: root.background,
                color: root.color,
                fontSize: root.fontSize,
            },
            hyperLink: root.hyperLink,
            children: []
        }

        this.createTree(nodeData, data)

        return { nodeData }
    }

    createTree(nodeData, data) {
        for (let i = 1; i < data.length; i++) {
            if (data[i].parent == nodeData.id) {
                let newNode = {
                    id: data[i].id,
                    topic: data[i].topic,
                    expanded: false,
                    root: false,
                    style: {
                        background: data[i].background,
                        color: data[i].color,
                        fontSize: data[i].fontSize,
                    },
                    hyperLink: data[i].hyperLink,
                    children: []
                }
                nodeData.children.push(newNode)
                this.createTree(newNode, data)
            }
        }
    }

    downloadMD(filename, text) {
        var element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
        element.setAttribute('download', filename);

        element.style.display = 'none';
        document.body.appendChild(element);

        element.click();

        document.body.removeChild(element);
    }

    getRecord(patientId: number) {
        this.display = false;     
        this.ME = new MindElixir(patientId);
        this.ME.init(); 
    }

}