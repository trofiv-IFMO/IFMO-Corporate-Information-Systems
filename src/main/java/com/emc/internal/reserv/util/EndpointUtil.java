package com.emc.internal.reserv.util;

import com.emc.internal.reserv.dto.FaultCode;
import com.emc.internal.reserv.dto.ServiceFault;
import com.emc.internal.reserv.exception.ServiceFaultException;
import lombok.extern.log4j.Log4j2;

import static java.text.MessageFormat.format;

/**
 * @author trofiv
 * @date 12.04.2017
 */
@Log4j2
public class EndpointUtil {
    public static String getInvalidFieldMessage(final String fieldName) {
        return format("{0} field is invalid!", fieldName);
    }

    public static ServiceFaultException raiseServiceFaultException(final FaultCode code, final Exception e) {
        return raiseServiceFaultException(code, e.getMessage());
    }

    public static ServiceFaultException raiseServiceFaultException(final FaultCode code, final String message) {
        final ServiceFault fault = createServiceFault(code, message);
        return new ServiceFaultException(message, fault);
    }

    private static ServiceFault createServiceFault(final FaultCode code, final String message) {
        final ServiceFault fault = new ServiceFault();
        fault.setCode(code);
        fault.setDescription(message == null ? "" : message);
        return fault;
    }

    public static String getInvalidReservationTypeMessage(final int id) {
        return format("Reservation type width id {0} does not exist!", id);
    }

    public static String getInvalidTimeRangeMessage(final String fieldName) {
        return format("Reservation time range is invalid, check field {0}!", fieldName);
    }

    public static String getNonexistentUserIdMessage(final int userId) {
        return format("User with id '{0}' has not been found!");
    }

    public static String getNonexistentUsernameMessage(final String username) {
        return format("User with username '{0}' has not been found!");
    }

    public static String getNonexistentResourceIdMessage(final int resourceId) {
        return format("Resource with id '{0}' has not been found!");
    }
}
