/**
 * Created by mpinto on 07/06/16.
 * Bootbox service wrapper for angular
 */

angular.module('mmibty.bootbox',[])
    .factory('mmibtyBootbox',function(){

        //saves dialog type
        var dialogType = {alert:1, confirm:2, prompt:3, custom:999};

        var show = function (type, title, message, footer, callback) {
            var options = { title: title, message: message };
            switch (type) {
                case dialogType.confirm:
                    options.buttons = {
                        cancel: {
                            label: "Cancel",
                            className: "btn-default",
                            callback: function(result) {
                                callback(false);
                            }
                        },
                        main: {
                            label: "OK",
                            className: "btn-primary",
                            callback: function (result) {
                                callback(true);
                            }
                        }
                    };
                    break;
                case dialogType.alert:
                default:
                    options.buttons = {
                        main: {
                            label: "OK",
                            className: "btn-primary"
                        }
                    };
                    break;
            }
            bootbox.dialog(options);
        };
        return {
            dialogType: dialogType,
            show: show
        };
    });