/*
 * JavaScript file for the application to demonstrate
 * using the API
 */

// Create the namespace instance
let ns = {};

// Create the model instance
ns.model = (function() {
    'use strict';

    let $event_pump = $('body');

    // Return the API
    return {
        'read': function() {
            let ajax_options = {
                type: 'GET',
                url: 'api/dependencies',
                accepts: 'application/json',
                dataType: 'json'
            };
            $.ajax(ajax_options)
            .done(function(data) {
                $event_pump.trigger('model_read_success', [data]);
            })
            .fail(function(xhr, textStatus, errorThrown) {
                $event_pump.trigger('model_error', [xhr, textStatus, errorThrown]);
            })
        },
        create: function(networkId, networkName, dependsOnNetworkId, startNetworkTime, endNetworkTime) {
            let ajax_options = {
                type: 'POST',
                url: 'api/dependencies',
                accepts: 'application/json',
                contentType: 'application/json',
                dataType: 'json',
                data: JSON.stringify({
                    'networkId': networkId,
                    'networkName': networkName,
                    'dependsOnNetworkId': dependsOnNetworkId,
                    'startNetworkTime': startNetworkTime,
                    'endNetworkTime': endNetworkTime
                })
            };
            $.ajax(ajax_options)
            .done(function(data) {
                $event_pump.trigger('model_create_success', [data]);
            })
            .fail(function(xhr, textStatus, errorThrown) {
                $event_pump.trigger('model_error', [xhr, textStatus, errorThrown]);
            })
        },
        'delete': function(networkId) {
            let ajax_options = {
                type: 'DELETE',
                url: 'api/dependencies/' + networkId,
                accepts: 'application/json',
                contentType: 'plain/text'
            };
            $.ajax(ajax_options)
            .done(function(data) {
                $event_pump.trigger('model_delete_success', [data]);
            })
            .fail(function(xhr, textStatus, errorThrown) {
                $event_pump.trigger('model_error', [xhr, textStatus, errorThrown]);
            })
        }
    };
}());

// Create the view instance
ns.view = (function() {
    'use strict';
    let $networkId = $('#networkId'),
        $networkName = $('#networkName'),
        $dependsOnNetworkId = $('#dependsOnNetworkId'),
        $startNetworkTime = $('#startNetworkTime'),
        $endNetworkTime = $('#endNetworkTime');

    // return the API
    return {
        reset: function() {
            $networkId.val('');
            $networkName.val('');
            $dependsOnNetworkId.val('');
            $startNetworkTime.val('');
            $endNetworkTime.val('').focus();
        },
        update_editor: function(networkId, networkName, dependsOnNetworkId, startNetworkTime, endNetworkTime) {
            $networkId.val(networkId);
            $networkName.val(networkName);
            $dependsOnNetworkId.val(dependsOnNetworkId);
            $startNetworkTime.val(startNetworkTime);
            $endNetworkTime.val(endNetworkTime);
        },
        build_table: function(dependencies) {
            let rows = ''

            // clear the table
            $('.dependencies table > tbody').empty();

            // did we get a dependencies array?
            if (dependencies) {
                for (let i=0, l=dependencies.length; i < l; i++) {
                    rows += `<tr><td class="networkId">${dependencies[i].networkId}</td><td class="networkName">${dependencies[i].networkName}</td>
                            <td class="dependsOnNetworkId">${dependencies[i].dependsOnNetworkId}</td><td class="startNetworkTime">${dependencies[i].startNetworkTime}</td>
                            <td class="endNetworkTime">${dependencies[i].endNetworkTime}</td></tr>`;
                }
                $('table > tbody').append(rows);
            }
        },
        error: function(error_msg) {
            $('.error')
                .text(error_msg)
                .css('visibility', 'visible');
            setTimeout(function() {
                $('.error').css('visibility', 'hidden');
            }, 3000)
        }
    };
}());

// Create the controller
ns.controller = (function(m, v) {
    'use strict';

    let model = m,
        view = v,
        $event_pump = $('body'),
        $networkId = $('#networkId'),
        $networkName = $('#networkName'),
        $dependsOnNetworkId = $('#dependsOnNetworkId'),
        $startNetworkTime = $('#startNetworkTime'),
        $endNetworkTime = $('#endNetworkTime');

    // Get the data from the model after the controller is done initializing
    setTimeout(function() {
        model.read();
    }, 100)

    // Validate input
    function validate(networkId, networkName) {
        return networkId !== "" && networkName !== "";
    }

    // function to create a new task on the fly
    $('#create').click(function(e) {
        let networkId = $networkId.val(),
            networkName = $networkName.val(),
            dependsOnNetworkId = $dependsOnNetworkId.val(),
            startNetworkTime = $startNetworkTime.val(),
            endNetworkTime = $endNetworkTime.val();
        e.preventDefault();

        if (validate(networkId, networkName)) {
            model.create(networkId, networkName, dependsOnNetworkId, startNetworkTime, endNetworkTime)
        } else {
            alert('Problem with Creating Task input');
        }
    });

    //function to delete the task
    $('#delete').click(function(e) {
        let networkId = $networkId.val();
        e.preventDefault();

        if (validate('placeholder', networkId)) {
            model.delete(networkId)
        } else {
            alert('Problem with delete task input');
        }
        e.preventDefault();
    });

    $('#reset').click(function() {
        view.reset();
    })

    //double click to select the row to display the contents in the fields
    $('table > tbody').on('dblclick', 'tr', function(e) {
        let $target = $(e.target),
            networkId,
            networkName,
            dependsOnNetworkId,
            startNetworkTime,
            endNetworkTime;

        networkId = $target
            .parent()
            .find('td.networkId')
            .text();

        networkName = $target
            .parent()
            .find('td.networkName')
            .text();

        dependsOnNetworkId = $target
            .parent()
            .find('td.dependsOnNetworkId')
            .text();

        startNetworkTime = $target
            .parent()
            .find('td.startNetworkTime')
            .text();

        endNetworkTime = $target
            .parent()
            .find('td.endNetworkTime')
            .text();

        view.update_editor(networkId, networkName, dependsOnNetworkId, startNetworkTime, endNetworkTime);
    });

    // Handle the model events
    $event_pump.on('model_read_success', function(e, data) {
        view.build_table(data);
        view.reset();
    });

    $event_pump.on('model_create_success', function(e, data) {
        model.read();
    });

    $event_pump.on('model_delete_success', function(e, data) {
        model.read();
    });

    $event_pump.on('model_error', function(e, xhr, textStatus, errorThrown) {
        let error_msg = textStatus + ': ' + errorThrown + ' - ' + xhr.responseJSON.detail;
        view.error(error_msg);
        console.log(error_msg);
    })
}(ns.model, ns.view));
