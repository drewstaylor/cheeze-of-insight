contract Simple{
     bytes32 public constant moveMask = 0x0303030303000000000000000000000000000000000000000000000000000000;

    /// @dev The moves come in from the front end as 2, 3, and 4; the logic below is simpler if the valid
    /// moves are 0, 1, 2. Thus, we subtract 2 from each value to put things in the range that works well for us.
    /// See WizardConstants for the element values, to understand where 2, 3 and 4 come from.
    uint256 internal constant moveDelta = 0x0202020202000000000000000000000000000000000000000000000000000000;
    
      function isValidMoveSet(bytes32 moveSet) public pure returns(bool) { // solium-disable-line security/no-assign-params
        // Map the input values 2, 3, 4 onto 0, 1, 2.
        moveSet = bytes32(uint256(moveSet) - moveDelta);

        // Fails if any bit is set outside the allowed mask
        if (moveSet != (moveSet & moveMask)) {
            return false;
        }

        // The previous line ensures that all values are 0, 1, 2, or 3, but
        // 3 isn’t actually valid. The following check ensures that no two
        // adjacent bits are set, which excludes any threes.
        if ((moveSet & (moveSet << 1)) != bytes32(0)) {
            return false;
        }

        return true;
    }
    
}