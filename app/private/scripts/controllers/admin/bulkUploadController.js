'use strict';

/**
 * @ngdoc function
 * @name playerApp.controller:adminController
 * @author Poonam Sharma
 * @description
 * # adminController
 * Controller of the playerApp
 */
angular.module('playerApp')
    .controller('bulkUploadController', [
        'adminService',
        '$timeout',
        '$state',
        'config',
        '$rootScope',
        '$scope',
        'contentService',
        'toasterService',
        function (adminService, $timeout, $state, config, $rootScope, $scope,
            contentService, toasterService
        ) {
            var admin = this;
            admin.bulkUsers = {};
               // sample CSV
            admin.sampleOrgCSV = [{
                orgName: 'orgName',
                isRootOrg: 'isRootOrg',
                channel: 'channel',
                externalId: 'externalId',
                provider: 'provider',
                description: 'description'
            }];
            admin.sampleUserCSV = [{
                firstName: 'firstName',
                lastName: 'lastName',
                phone: 'phone',
                email: 'email',
                userName: 'userName',
                password: 'password',
                provider: 'provider',
                phoneVerified: 'phoneVerified',
                emailVerified: 'emailVerified',
                roles: 'roles',
                position: 'position',
                grade: 'grade',
                location: 'location',
                dob: 'dob',
                aadhaarNo: 'aadhaarNo',
                gender: 'gender',
                language: 'language',
                profileSummary: 'profileSummary',
                subject: 'subject'
            }
            ];

              // open  upload csv modal

            admin.orgBulkUpload = function () {
                $('#orgBulkUpload').modal({
                    onShow: function () {
                        admin.fileName = '';
                        admin.bulkOrgProcessId = '';
                        admin.loader = {};
                    },
                    onHide: function () {
                        admin.loader = {};
                        admin.fileName = '';
                        admin.bulkOrgProcessId = '';
                        $('#orgBulkUpload').modal({ detachable: false });
                        // $('#orgBulkUpload').modal('hide');
                        // $('#orgBulkUpload').modal('hide others');
                        // $('#orgBulkUpload').modal('hide dimmer');
                        return true;
                    }
                }).modal('show');
                $('#orgBulkUpload').modal('refresh');
                $('.ui.modal.hidden').remove();
            };
            admin.userBulkUpload = function () {
                $('#userBulkUpload').modal('refresh');
                $('#userBulkUpload').modal({
                    onShow: function () {
                        admin.bulkUsers = {};
                        admin.fileName = '';
                        admin.bulkUsersProcessId = '';
                        $('#bulkUsers').form('reset');
                        admin.loader = {};
                        admin.isUploadLoader = false;
                    },
                    onHide: function () {
                        return true;
                    }
                }).modal('show');
            };
            admin.statusBulkUpload = function () {
                $('#statusBulkUpload').modal('refresh');
                $('#statusBulkUpload').modal({
                    onShow: function () {
                        $('#statusForm').form('reset');
                        admin.uploadStatusKey = '';
                        admin.bulkUploadStatus = {};
                        admin.bulkUploadStatus.processId = '';
                        admin.processID = '';
                    },
                    onHide: function () {
                        admin.bulkUploadStatus = {};
                        admin.bulkUploadStatus.processId = '';
                        return true;
                    }
                }).modal('show');
            };

              // bulk upload

            admin.openImageBrowser = function (key) {
                if (key === 'users') {
                    if (!((admin.bulkUsers.provider && admin.bulkUsers.externalid)
                    || admin.bulkUsers.OrgId)) {
                        admin.bulkUploadError = true;
                        admin.bulkUploadErrorMessage =
                         $rootScope.errorMessages.ADMIN.bulkUploadErrorMessage;
                        if (!admin.bulkUploadError) {
                            $timeout(function () {
                                admin.bulkUploadError = false;
                                admin.bulkUploadErrorMessage = '';
                                admin.bulkUsers = {};
                            }, 5000);
                        }
                    } else if (!admin.bulkUploadError) {
                        admin.isUploadLoader = true;
                        $('#uploadUsrsCSV').click();
                    }
                } else if (key === 'organizations') {
                    admin.isUploadLoader = true;
                    $('#orgUploadCSV').click();
                }
            };
            $scope.validateFile = function (files, key) {
                var fd = new FormData();
                var reader = new FileReader();
                if (files[0] && files[0].name.match(/.(csv)$/i)) {
                    // && files[0].size < 4000000) {
                    reader.onload = function () {
                        if (key === 'users') {
                            fd.append('user', files[0]);
                            admin.bulkUploadUsers(fd);
                        } else if (key === 'organizations') {
                            fd.append('org', files[0]);
                            admin.bulkUploadOrganizations(fd);
                        }
                    };
                    admin.fileName = files[0].name;
                    reader.readAsDataURL(files[0]);
                    admin.fileToUpload = fd;
                } else {
                    toasterService.error($rootScope.errorMessages.ADMIN.notCSVFile);
                }
            };
            admin.bulkUploadUsers = function () {
                $('#uploadUsrsCSV').val('');
                admin.loader = toasterService
                                .loader('', $rootScope.errorMessages.ADMIN.uploadingUsers);
                admin.fileToUpload.append('organisationId', admin.bulkUsers.OrgId);
                admin.fileToUpload.append('externalid', admin.bulkUsers.externalid);
                admin.fileToUpload.append('provider', admin.bulkUsers.provider);

                adminService.bulkUserUpload(admin.fileToUpload).then(function (res) {
                    admin.loader.showLoader = false;
                    if (res.responseCode === 'OK') {
                        admin.bulkUsersProcessId = res.result.processId;
                        admin.bulkUsersRes = res.result.response;
                        toasterService.success($rootScope.errorMessages.ADMIN.userUploadSuccess);
                    } else if (res.responseCode === 'CLIENT_ERROR') {
                        toasterService.error(res.params.errmsg);
                    } else { toasterService.error($rootScope.errorMessages.ADMIN.fail); }
                }).catch(function (err) {// eslint-disable-line
                    admin.loader.showLoader = false;
                    toasterService.error($rootScope.errorMessages.ADMIN.fail);
                });
            };
            admin.bulkUploadOrganizations = function () {
                $('#orgUploadCSV').val('');
                admin.loader = toasterService
                .loader('', $rootScope.errorMessages.ADMIN.uploadingOrgs);
                adminService.bulkOrgrUpload(admin.fileToUpload).then(function (res) {
                    admin.loader.showLoader = false;
                    if (res.responseCode === 'OK') {
                        admin.bulkOrgProcessId = res.result.processId;
                        admin.bulkOrgRes = res.result.response;
                        toasterService.success($rootScope.errorMessages.ADMIN.orgUploadSuccess);
                    } else if (res.responseCode === 'CLIENT_ERROR') {
                        toasterService.error(res.params.errmsg);
                    } else { toasterService.error($rootScope.errorMessages.ADMIN.fail); }
                }).catch(function (err) {// eslint-disable-line
                    admin.loader.showLoader = false;
                    toasterService.error($rootScope.errorMessages.ADMIN.fail);
                });
            };
            admin.closeBulkUploadError = function () {
                admin.bulkUploadError = false;
                admin.bulkUploadErrorMessage = '';
                admin.bulkUsers = {};
            };
            admin.getBulkUloadStatus = function (id, key) {
                admin.loader = toasterService.loader('', 'Getting status ');
                adminService.bulkUploadStatus(id).then(function (res) {
                    admin.loader.showLoader = false;
                    $('#statusBulkUpload').modal({ observeChanges: true }).modal('refresh');
                    if (res.responseCode === 'OK') {
                        admin.uploadStatusKey = key;
                        admin.bulkUploadStatus.success = res.result.response[0].successResult;
                        admin.bulkUploadStatus.failure = res.result.response[0].failureResult;
                        admin.bulkUploadStatus.processId = res.result.response[0].processId;
                        toasterService.success($rootScope.errorMessages.ADMIN.statusSuccess);
                    } else {
                        toasterService.error($rootScope.errorMessages.ADMIN.fail);
                    }
                }).catch(function (err) {// eslint-disable-line
                    admin.loader.showLoader = false;
                    toasterService.error($rootScope.errorMessages.ADMIN.fail);
                });
            };
            admin.downloadSample = function (key) {
                if (key === 'users') {
                    alasql('SELECT * INTO CSV(\'Sample_Users.csv\', {headers: false,separator:","}) FROM ?',
                [admin.sampleUserCSV]);
                } else if (key === 'organizations') {
                    alasql(' SELECT *  INTO CSV(\'Sample_Organizations.csv\',' +
                    ' {headers: false,separator:","}) FROM ?',
                [admin.sampleOrgCSV]);
                }
            };
        }]);