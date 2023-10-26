list = ['dscds\r\ndscf\r\nddcf\r\nvsdc\r\nzx\r\n\r\ncsd\r\n\r\n\r\n\r\nd']
x = list[0].split("\r\n")

for a in x:
    if a != "":
        print(a)