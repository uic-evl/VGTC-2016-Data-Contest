
# Combines points, test events, and states to extract state level info

import csv

inFile1 = '../ACT_AllPointsFile.csv'
inFile2 = '../ACT_TestEvents.csv'
inFile3 = '../zip_codes.csv'

outFile1 = '../stateSummary.csv'
fin1 = open(inFile1,'r')
fin2 = open(inFile2,'r')
fin3 = open(inFile3,'r')

fout1 = open(outFile1, 'w')


handle1 = csv.reader(fin1)
handle2 = csv.reader(fin2)
handle3 = csv.reader(fin3)

head1 = handle1.next()
head2 = handle2.next()
head3 = handle3.next()

##print head1
##print head2
##print head3

head4 = head1 + ["STATE"]
zipTable = {}

h3Zip = head3.index('ZIP_CODE')
h3StateCode = head3.index('STATE_ABBREVIATION')
stateCodeArray = []
for row in handle3:
    zipTable[row[h3Zip]] = row[h3StateCode]
    if row[h3StateCode] not in stateCodeArray:
        stateCodeArray.append(row[h3StateCode])

h1Point = head1.index('POINTID')
h1Zip = head1.index('ZIPCODE')
h1PointType = head1.index('POINTTYPE')
h1Population = head1.index('POPULATION')
h1Center = head1.index('TESTCENTERID')
h4State = head4.index('STATE')
h2Center = head2.index('TestCenterID')

pointsTable = {}
centerIdTable = {}
for row in handle1:
    zipCode = row[h1Zip]
    if zipCode in zipTable:
        if row[h1PointType] == "ZIP":
            pointsTable[row[h1Point]] = row + [zipTable[zipCode]]
        else:
            centerIdTable[row[h1Center]] = zipTable[zipCode]



statePopulationTable = {}
count = 0
for key in pointsTable:
##    if count == 100:
##        break
##    else:
##        count = count + 1
    row = pointsTable[key]
    state = row[h4State]
    if state in statePopulationTable:
        statePopulationTable[state] = statePopulationTable[state] + int(row[h1Population])
    else:
        statePopulationTable[state] = int(row[h1Population])

##print statePopulationTable
stateTableHead = ["STATE", "POPULATION", "Centers", "CAPACITY", "ASSIGNED", "EXPENSE", "SPECIAL"]
states = {}
h2Capacity = head2.index("CAPACITY")
h2Assigned = head2.index("ASSIGNED")
h2Special = head2.index("ASSIGNED_SPECIAL_FL")
h2Expense = head2.index("EXPENSE")
for row in handle2:
##    if count == 1000:
##        break
##    else:
##        count = count + 1
    centerID = row[h2Center]
    if centerID in centerIdTable:
        centerState = centerIdTable[centerID]
        if centerState in states:
            stateRow = states[centerState]
            stateRow[1] = stateRow[1] + 1
            stateRow[2] = stateRow[2] + float(row[h2Capacity])
            stateRow[3] = stateRow[3] + float(row[h2Assigned])
            stateRow[4] = stateRow[4] + float(row[h2Expense])
        else:
            states[centerState] = [statePopulationTable[centerState], 1, float(row[h2Capacity]), float(row[h2Assigned]), float(row[h2Expense]), 0]
        if row[h2Special] == "Y":
            states[centerState][5] = states[centerState][5] + 1

#print states

handleOut = csv.writer(fout1)
handleOut.writerow(stateTableHead)

for key in states:
    row = [key] + states[key]
    handleOut.writerow(row)

count = 1
for s in stateCodeArray:
    if s not in states:
        print  str(count) + " . " + s + " not in list"
    else:
        print  str(count) + " . " + s + " in list"
    count = count + 1

fin1.close()
fin2.close()
fin3.close()
fout1.close()
