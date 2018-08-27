import { ImageUploadComponent } from '../../../core/widget/imageupload/imageupload/imageupload.component';
import { Attribute } from './../../attributes/shared/attribute.model';
import { AttributesService } from './../../attributes/shared/attributes.service';
import { LocationService } from './../../locations/shared/location.service';
import { GlobalService } from '../../../core/global.service';
import { ValidationService } from '../../../core/validators/validation.service';
import { Task, TaskModel, Attribute as TaskAttribute } from '../shared/task.model';
import { TaskService } from '../shared/task.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Message, SelectItem } from 'primeng/primeng';
import { Observable, Subscription } from 'rxjs/Rx';
import { environment } from '../../../../environments/environment';
import { FloorService } from './../../floors/shared/floor.service';
import { ZoneService } from './../../zones/shared/zone.service';
import { UserService } from '../../users/shared/user.service';


@Component({
    selector: 'app-task-add',
    templateUrl: './task.component.html',
    styleUrls: ['./task.component.scss'],
    providers: [TaskService, GlobalService, AttributesService, ImageUploadComponent,
        LocationService, ValidationService, FloorService, ZoneService, UserService]
})
export class TaskComponent implements OnInit, OnDestroy {
    savedImages: Array<any> = [];
    relatedImages: Array<any> = [];
    images: Array<any> = [];
    totalRecords: number;
    previousQuery: any;
    msgs: Message[] = [];
    submitted: boolean;
    description: string;
    location: any;
    taskForm: FormGroup;
    data: any;
    private subscription: Subscription;
    title: String = '';
    id: String = '';
    taskModel: Observable<TaskModel>;
    addressList: any;
    attributeNameOptionList: SelectItem[];
    attributeList: SelectItem[];
    display = false;
    datalist: Attribute[] = [];
    blankAttribute: TaskAttribute;
    task = <Task>{};
    tags = [];
    selectedCategory = [];
    selectedUsers = [];
    taskThings = [];
    loader = false;
    attributeOptionList: SelectItem[];
    isTaskInit = false;
    isUserInit = false;
    floorList = [];
    zoneList = [];
    floorArray = [];
    floorId: String = '';
    floorVal: String = '';
    isLocationInit = false;
    isEdit = false;
    displayDialog = false;
    parentOptionList: SelectItem[];
    selectedAttribute: TaskAttribute;
    showDelete = false;
    dialogTitle: String = '';
    zoneArray = [];
    dateFormat: String;
    allUsers: any = [];

    /**
     * Constructor Definition
     * @param FormBuilder
     * @param TaskService
     * @param GlobalService
     * @param Router
     * @param ActivatedRoute
     */
    constructor(
        private fb: FormBuilder,
        private taskService: TaskService,
        private globalService: GlobalService,
        private router: Router,
        private floorService: FloorService,
        private zoneService: ZoneService,
        private userService: UserService,
        // private attributeService: AttributesService,
        // private locationService: LocationService,
        private validationService: ValidationService,
        private route: ActivatedRoute, ) { }

    /**
     * Init function definition
     * @memberof TaskComponent
     */
    ngOnInit() {
        this.dateFormat = this.globalService.getCalenderDateFormat();
        this.prepareForm();
        this.fetchDropDown();
        this.savedImages = [];
        this.relatedImages = [];
        this.images = [];

        this.userService.listUsers('').subscribe(
            (data: any) => {
                this.allUsers = data.data;
            },
            (error: any) => {
                error;
            }
        );

        this.subscription = this.route.params.subscribe(
            (params: any) => {
                if (params.hasOwnProperty('id')) {
                    this.setEditDefaultStatus();
                    this.id = params['id'];
                    this.loader = true;
                    this.taskService.get(this.id).subscribe(data => {
                        this.loader = false;
                        this.task = data.data;
                        this.taskThings = this.task.things;
                        /*this.task.attributes.push({
                            name: 'Select Attribute',
                            id: 'Select Attribute', value: '', status: 0, sysDefined: 0
                        });*/

                        this.updateTask(this.task);
                        this.getParentDropdowns(this.task.id);


                    },
                        error => this.showError(error));
                    this.title = 'Edit Activity';

                } else {
                    this.task.attributes = [];
                    this.title = 'Add Activity';
                    this.getParentDropdowns(null);


                }
            }
        );
    }

    /**
     * Function for destroying all the components behavior
     * @memberof TaskComponent
     */
    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }
    getParentDropdowns(taskId: string) {
        this.globalService.getParentDropdown('tasks' + environment.serverEnv, taskId).subscribe(data => {
            this.parentOptionList = this.globalService.prepareDropDown(data.data, 'Select Parent');
            this.taskForm.patchValue({
                parent: this.task.parent,

            });
        }, error => this.showError(error));
    }

    /**
     * Fuction for set the form values in edit
     * @memberof TaskComponent
     */
    updateTask(task: Task) {
        // console.log(this.globalService.calendarformatDate(task.from), this.globalService.calendarformatDate(task.to));
        // console.log('update value ' + this.selectedCategory);
        this.isEdit = true;
        //  this.tags = this.globalService.getTagKeywords(task.tags);
        // set users on edit mode
        if (task.attendees) {
            task.attendees.forEach((user) => {
                this.selectedUsers.push(user.uuid);
            });
        }
        this.savedImages = Object.assign(task.images);
        if (task.images) {
            task.images.forEach((prodImage) => {
                this.images.push(this.globalService.processImage(prodImage));
            });
        }
        this.relatedImages = Object.assign(task.images);
        this.fetchZoneOnUpdate(task.location.id, task.location.floor.id, task.location.floor.zone.id);
        this.location = task.location.id;
        this.taskForm.patchValue({
            name: task.name,
            code: task.code,
            tags: this.tags,
            location: this.isLocationInit ? task.location.id : null,
            floor: this.floorVal,
            zone: task.location.floor.zone.id,
            price: task.price,
            users: this.isUserInit ? this.selectedUsers : [],
            // categories: this.isTaskInit ? this.selectedCategory : [],
            description: task.description,
            videoUrl: task.videoUrl,
            parent: '',
            url: task.url,
            images: [],
            from: this.globalService.calendarformatDate(task.from),
            to: this.globalService.calendarformatDate(task.to),
            status: task.status === 1 ? true : false
        });
    }

    /**
     * Function to fetch dropdown values on the
     * basis of parameter given.
     * @memberof TaskComponent
     */
    fetchDropDown() {
        /// Get the Attribites List from API ////
        this.globalService.getDropdown('attributes' + environment.serverEnv).subscribe(data => {
            this.attributeOptionList = this.globalService.prepareDropDown(data.data, 'Select');
            this.attributeNameOptionList = this.globalService.prepareHandlerNameList(data.data);
            this.attributeNameOptionList.unshift({ label: 'Select Attribute', value: null });
        },
            error => this.showError(error));

        this.globalService.getDropdown('locations' + environment.serverEnv).subscribe(data => {
            this.addressList = this.globalService.prepareDropDown(data.data, 'Select Location');
            this.isLocationInit = true;
            if (this.location !== undefined && this.location !== null) {
                // console.log('location fetch update prodcut');
                this.taskForm.patchValue({
                    location: this.task.location.id,
                });
            }
        },
            error => this.showError(error));
    }

    /**
     * Function for preparing the form
     * @memberof TaskComponent
     */
    prepareForm() {
        this.taskForm = this.fb.group({
            'name': ['', [Validators.required, Validators.maxLength(environment.nameMaxLength)]],
            'code': ['', [Validators.required, Validators.maxLength(environment.codeMaxLength)]],
            'price': ['', [ValidationService.priceValidator]],
            // 'tags': [this.tags],
            'location': ['', [Validators.required]],
            'users': [this.selectedUsers, [Validators.required]],
            'description': ['', [Validators.required]],
            'floor': [''],
            'zone': [''],
            'from': ['', [Validators.required]],
            'to': ['', [Validators.required]],
            'videoUrl': ['', [ValidationService.videoUrlValidator]],
            'url': ['', [ValidationService.urlValidator]],
            'status': [true],
            'images': [],
            'parent': '',
            'attributes': this.fb.array([])
        });
        this.taskForm.controls.attributes = this.fb.group({
            'attributeType': [''],
            'attributeValue': [''],
        });
    }

    /**
     * Calling the edit API
     * @param {int} id
     * @param id
     */
    onEdit(id) {
        this.router.navigate(['/tasks', id, 'edit']);
    }


    /**
     * Navigation back
     * @private
     * @memberof TaskComponent
     */
    private navigateBack() {
        this.router.navigate(['/tasks']);
    }

    /**
     * Initialising Attribute
     * @memberof TaskComponent
     */
    initAttribute() {
        return this.fb.group({
            'id': ['', []],
            'value': ['', []],
        });
    }

    /**
     * Submit Action
     * @param {string} value
     * @memberof TaskComponent
     */
    onSubmit(value: any) {
        if (value.status === true) {
            value.status = 1;
        } else if (value.status === false) {
            value.status = 0;
        }
        value.attributes = [];
        this.submitted = true;
        value.images = this.relatedImages;
        const users = value.users;
        value.attendees = [];
        if (users.length > 0) {
            users.forEach((userSub) => {
                const userData = this.allUsers.filter((x: any) => x.sub === userSub);
                if (userData.length) {
                    value.attendees.push({
                        'uuid': userData[0].sub,
                        'name': userData[0].given_name + ' ' + userData[0].family_name,
                        'firstName': userData[0].given_name,
                        'lastName': userData[0].family_name,
                        'email': userData[0].email,
                        'mobileNo': userData[0].MobileNumber
                    });
                }
            });
        }
        value.from = this.globalService.processDate(value.from);
        value.to = this.globalService.processDate(value.to);
        if (this.id === '') {
            this.saveTask(value);
        } else {
            this.editTask(value);
        }

    }

    /**
     * Save Task Function
     * @param {any} value
     * @memberof TaskComponent
     */
    saveTask(value) {
        this.loader = true;
        this.taskService.add(value).subscribe(
            data => {
                this.data = data.data;
                this.showSuccess('Activity saved successfully');
            },
            error => this.showError(error));
    }

    /**
     * Edit Task Function
     * @param {any} value
     * @memberof TaskComponent
     */
    editTask(value) {
        this.loader = true;
        value.code = this.task.code;
        this.taskService.update(value, this.id).subscribe(
            data => {
                this.data = data;
                this.showSuccess('Activity updated successfully');
            },
            error => this.showError(error));
    }

    public showError(error: any) {
        this.loader = false;
        this.validationService.showError(this.taskForm, error);
    }

    public showSuccess(message: string) {
        this.loader = false;
        this.msgs = [];
        this.msgs.push({ severity: 'success', summary: 'Success', detail: message });
        setTimeout(() => {
            this.navigateBack();
        }, environment.successMsgTime);
    }

    /**
     * delete Attribute row
     * @param {*} data
     * @memberof TaskComponent
     */
    deleteRow(data: any) {
        data;
        this.task.attributes = this.task.attributes.filter(obj => obj !== this.selectedAttribute);
        this.displayDialog = false;
    }

    /**
     * When tags are updated.
     * @memberof TaskComponent
     */
    onTagUpdate(event) {
        this.tags = event;
    }


    /**
     * Initialising Things Dropdown
     * @memberof TaskComponent
     */
    onUsersInit(event) {
        if (typeof (event) === 'boolean') {
            this.isUserInit = event;
            if (this.selectedUsers.length > 0) {
                this.updateUsers();
            }
        } else {
            this.showError(event);
        }


    }

    updateUsers() {
        this.taskForm.patchValue({
            users: this.selectedUsers,
        });
    }

    /**
     * On finalising the upload images of task.
     * @memberof TaskComponent
     */
    onImageListFinalised(event) {
        this.relatedImages = event;
    }

    /**
     * Function to navigate to previous page
     * @memberof CategoryComponent
     */
    onCancel() {
        this.navigateBack();
    }

    /**
     * To fetch floors of a particular location
     * @memberof TaskComponent
     */
    fetchFloor(type, floorId = null, zoneId = null) {
        this.floorList = [];
        this.zoneList = [];
        this.floorArray = [];

        this.loader = true;

        // if (type) {
        // console.log('set blank floorlist');
        this.floorList.push({ label: 'Select Floor', value: null });
        this.floorService.getFloor(type).subscribe(data => {
            // console.log(data);
            this.floorArray = data.data;
            // console.log('Floor Array' + this.floorArray);
            this.floorList = this.globalService.prepareDropDown(this.floorArray, 'Select Floor');
            this.zoneList = [];
            // console.log('Floor List' + this.floorList.length);
            this.loader = false;
            if (floorId != null) { // edit mode
                this.taskForm.patchValue({ floor: floorId });
                this.fetchZone(floorId, zoneId);
            }
        },
            error => {
                this.floorList = [{ 'label': 'No Floors Available', 'value': null }]
                this.showError(error);
            });
        // }
    }

    /**
     * To fetch zones of a particular floor
     * @memberof TaskComponent
     */
    fetchZone(type, zoneId = null) {
        this.zoneList = [];
        this.zoneArray = [];
        this.loader = true;
        // if (type !== null) {
        this.zoneList.push({ label: 'Select Zone', value: null });
        // console.log('fetch zone called ' + type);
        this.zoneService.getZone(type).subscribe(data => {
            // console.log(data);
            this.zoneArray = data.data;
            this.zoneList = this.globalService.prepareDropDown(this.zoneArray, 'Select Zone');
            // console.log('Zone List' + this.zoneList.length);
            this.loader = false;
            if (zoneId != null) {
                this.taskForm.patchValue({ zone: zoneId });
            }
        },
            error => {
                this.zoneList = [{ 'label': 'No Zones Available', 'value': null }]
                this.showError(error);
            });
        // }
        // this.zoneArray = [];
    }

    /**
     * function called to fetch zones and floor on the basis
     * of location and zone id for edit view.
     * @param {string} locationId
     * @param {string} floorId
     * @param {string} zoneId
     * @memberof TaskComponent
     */
    fetchZoneOnUpdate(locationId, floorId, zoneId) {
        if (locationId) {
            this.fetchFloor(locationId, floorId, zoneId);
        }
    }

    /**
     * To add Attribute
     * @memberof TaskComponent
     */
    addMoreAttribute() {
        this.dialogTitle = 'Add Attribute';
        this.showDelete = false;
        this.displayDialog = true;
        this.taskForm.controls.attributes = this.fb.group({
            'attributeType': ['', [Validators.required]],
            'attributeValue': ['', [Validators.required]],
        });
        this.taskForm.controls.attributes.reset({
            attributeType: '',
            attributeValue: '',
        });
    }

    onRowSelect(event) {
        this.dialogTitle = 'Edit Attribute';
        this.showDelete = true;
        this.taskForm.controls.attributes.patchValue({
            attributeType: event.data.name,
            attributeValue: event.data.value,
        });
        this.displayDialog = true;
    }


    /**
     * To save Attribute of task
     * @memberof TaskComponent
     */
    saveAttributes(data) {
        const attributes = [...this.task.attributes];
        if (this.task.attributes.indexOf(this.selectedAttribute) < 0) {
            this.blankAttribute = { name: data.attributeType, id: '', value: data.attributeValue, status: 0, sysDefined: 0 };
            attributes.push(this.blankAttribute);
        } else {
            this.blankAttribute = {
                name: data.attributeType,
                id: data.id, value: data.attributeValue, status: 0, sysDefined: 0
            };
            attributes[this.task.attributes.indexOf(this.selectedAttribute)] = this.blankAttribute;
        }
        this.task.attributes = attributes;
        this.displayDialog = false;
        this.taskForm.controls.attributes.patchValue({
            attributeType: '',
            attributeValue: '',
        });
    }

    /**
     * To close Attribute Dialog
     * @memberof TaskComponent
     */
    closeDialog() {
        this.displayDialog = false;
    }

    setEditDefaultStatus() {
        this.taskForm.patchValue({
            status: 0,

        });
    }

}
